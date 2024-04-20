from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import numpy as np
import time
import gym
from gym import spaces

class CosmicVoyageEnv(gym.Env):
    metadata = {'render.modes': ['human']}

    def __init__(self):
        super(CosmicVoyageEnv, self).__init__()
        service = Service(executable_path=r'C:\Users\Andy\Documents\GitHub\chromedriver-win64\chromedriver.exe')
        self.driver = webdriver.Chrome(service=service)
        self.driver.get('https://andreas-t-bachmeier.github.io/CosmicVoyage.html')
        self.driver.maximize_window()

        self.last_reset_time = 0
        self.reset_cooldown = 4  # Minimum seconds between resets

        # Define the action space and the observation space
        self.action_space = spaces.Discrete(3)  # Actions: stay, move left, move right
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(21,), dtype=np.float32)  # 1 astronaut position + 10 obstacles * 2 distances each

        self.reset()

    def reset(self):
        current_time = time.time()
        if current_time - self.last_reset_time < self.reset_cooldown:
            print("Reset cooldown active. Skipping reset.")
            return self.get_observation()  # Return the current state without resetting

        try:
            button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, 'startButton'))
            )
            button.click()  # Click to reset the game
            time.sleep(2)  # Ensure that reset has time to fully process
            self.last_reset_time = current_time  # Update last reset timestamp
        except Exception as e:
            print(f"An error occurred during reset: {str(e)}")

        return self.get_observation()

    def step(self, action):
        if action == 1:
            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_LEFT)
        elif action == 2:
            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_RIGHT)

        time.sleep(0.5)  # Delay to allow the action to take effect

        done = self._check_game_over()
        observation = self.get_observation()
        score_text = self.driver.find_element(By.ID, 'score').text
        score = float(score_text.split(' ')[0])

        if done:
            time.sleep(1)  # Allow UI to stabilize before attempting reset
            self.reset()

            
        self.last_observation = self.get_observation()  # Store last observation

        return observation, score, done, {}

    
    def get_last_observation(self):
        return self.last_observation

    def _check_game_over(self):
        try:
            final_score_text = WebDriverWait(self.driver, 5).until(
                lambda driver: driver.find_element(By.ID, 'finalScore').text
            )
            return "𐠒 Astronaut Died 𐠒" in final_score_text
        except TimeoutException:
            return False
        except Exception as e:
            print(f"Error checking game over status: {e}")
            return False



    def get_obstacle_distances(self):
        try:
            # Wait until at least one obstacle is visible and has the required attributes
            WebDriverWait(self.driver, 10).until(
                EC.visibility_of_any_elements_located((By.CSS_SELECTOR, ".obstacle"))
            )
            
            # JavaScript to fetch distances and check visibility and attribute presence
            script = """
            return Array.from(document.querySelectorAll('.obstacle')).map(obstacle => {
                const horizontal = obstacle.getAttribute('data-horizontal-distance');
                const vertical = obstacle.getAttribute('data-vertical-distance');
                return {
                    visible: window.getComputedStyle(obstacle).display !== 'none' && horizontal !== null && vertical !== null,
                    horizontal: horizontal || 'Attribute not set',  // Provide default message if attribute is missing
                    vertical: vertical || 'Attribute not set'
                };
            }).slice(0, 10);
            """
            for attempt in range(5):  # Retry up to 5 times
                results = self.driver.execute_script(script)
                # Check if all obstacles have their attributes set
                if all(r['horizontal'] != 'Attribute not set' and r['vertical'] != 'Attribute not set' for r in results):
                    print("Results fetched successfully:", results)
                    return results
                print(f"Retrying to fetch results... Attempt {attempt + 1}")
                time.sleep(1)  # Wait a bit before retrying

            print("Failed to fetch all required attributes after retries.")
            return []

        except Exception as e:
            print("Error fetching distances:", e)

            return []


    

    def get_observation(self):
        astronaut = self.driver.find_element(By.ID, 'astronaut')
        astronaut_position = self.parse_position(astronaut.get_attribute('style'))
        
        distances = self.get_obstacle_distances()
        
        obs = [astronaut_position]  # Start with the astronaut's position
        for dist in distances:
            obs.extend([dist['horizontal'], dist['vertical']])
        
        # Ensure the observation is of the correct length by padding if necessary
        if len(obs) < 21:  # If fewer than 10 obstacles, pad the observation
            obs += [0.0] * (21 - len(obs))
        
        return np.array(obs)

    def parse_position(self, style):
        try:
            # Find the 'left' CSS attribute and convert it from pixel or percentage to a float value
            position_info = next(s for s in style.split(';') if 'left' in s)
            position_value = position_info.split(':')[1].replace('px', '').strip()
            if '%' in position_value:
                # Convert percentage to a pixel value assuming game area width is known
                game_area_width = self.driver.find_element(By.ID, 'gameArea').get_attribute('offsetWidth')
                return float(position_value.replace('%', '')) / 100.0 * float(game_area_width)
            else:
                return float(position_value)
        except Exception as e:
            print(f"Failed to parse astronaut position from style: '{style}'. Error: {e}")
            return 0.0

if __name__ == "__main__":
    env = CosmicVoyageEnv()
    for _ in range(10):
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)
        print(f"Observation: {obs}, Reward: {reward}, Done: {done}")
        if done:
            print("Game over detected, resetting environment")
            obs = env.reset()
    env.close()
