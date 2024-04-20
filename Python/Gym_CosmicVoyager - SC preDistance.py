from selenium.webdriver.common.action_chains import ActionChains
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, NoSuchElementException  # Include TimeoutException here
from selenium.webdriver.support import expected_conditions as EC
import numpy as np
import time
import  gym
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
        self.reset_cooldown = 5  # Minimum seconds between resets

        self.action_space = spaces.Discrete(3)  # Actions: stay, move left, move right
        self.observation_space = spaces.Box(low=0, high=255, shape=(1,), dtype=np.float32)
        self.reset()


    def reset(self):
        current_time = time.time()
        if current_time - self.last_reset_time < self.reset_cooldown:
            print("Reset cooldown active. Skipping reset.")
            return np.array([0.0])  # Skip reset if within cooldown period

        try:
            button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, 'startButton'))
            )
            button.click()  # Click to reset the game
            time.sleep(2)  # Ensure that reset has time to fully process

            # Wait for the astronaut to ensure the game has restarted
            WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.ID, 'astronaut')))

            astronaut = self.driver.find_element(By.ID, 'astronaut')
            astronaut_style = astronaut.get_attribute('style')

            self.last_reset_time = current_time  # Update last reset timestamp
            return np.array([self.parse_position(astronaut_style)])
        except Exception as e:
            print(f"An error occurred during reset: {str(e)}")
            return np.array([0.0])


    def step(self, action):
        if action == 1:
            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_LEFT)
        elif action == 2:
            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_RIGHT)

        time.sleep(0.5)

        score_text = self.driver.find_element(By.ID, 'score').text
        score = float(score_text.split(' ')[0])
        astronaut = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.ID, 'astronaut')))
        astronaut_position = self.parse_position(astronaut.get_attribute('style'))

        done = self._check_game_over()
        if done:
            time.sleep(1)  # Allow UI to stabilize before attempting reset
            self.reset()

        return np.array([astronaut_position]), score, done, {}
    

    def _check_game_over(self):
        try:
            final_score_text = WebDriverWait(self.driver, 5).until(
                lambda driver: driver.find_element(By.ID, 'finalScore').text
            )
            is_game_over = "𐠒 Astronaut Died 𐠒" in final_score_text
            print(f"Game Over Detected: {is_game_over}")
            return is_game_over
        except TimeoutException:
            print("Timeout while checking for game over.")
            return False
        except Exception as e:
            print(f"Error checking game over status: {e}")
            return False






    def parse_position(self, style):
        try:
            # Find the 'left' style attribute and remove the '%' sign
            position_info = next(s for s in style.split(';') if 'left' in s)
            position_value = position_info.split(':')[1].replace('px', '').replace('%', '').strip()

            # If the position is given in percentage, convert it to a float value as needed
            if '%' in position_info:
                # Assuming the game area width is known (e.g., 800 pixels)
                game_area_width = 800
                return float(position_value) / 100 * game_area_width
            else:
                return float(position_value)
        except Exception as e:
            print(f"Failed to parse astronaut position from style: '{style}'. Error: {e}")
            return 0.0


# loop
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
