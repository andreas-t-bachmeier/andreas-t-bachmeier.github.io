from selenium.webdriver.common.action_chains import ActionChains
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException, NoSuchElementException  # Include TimeoutException here
from selenium.webdriver.support import expected_conditions as EC
import numpy as np
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

        self.action_space = spaces.Discrete(3)  # Actions: stay, move left, move right
        self.observation_space = spaces.Box(low=0, high=255, shape=(1,), dtype=np.float32)
        self.reset()

    def step(self, action):
        if action == 1:
            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_LEFT)
        elif action == 2:
            self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_RIGHT)

        score_text = self.driver.find_element(By.ID, 'score').text
        score = float(score_text.split(' ')[0])
        astronaut = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.ID, 'astronaut')))
        astronaut_position = self.parse_position(astronaut.get_attribute('style'))

        done = self._check_game_over()
        if done:
            self.reset()

        return np.array([astronaut_position]), score, done, {}

    def _check_game_over(self):
        try:
            # Use WebDriverWait to wait for the specific text that signifies game over
            final_score_text = WebDriverWait(self.driver, 5).until(
                lambda driver: driver.find_element(By.ID, 'finalScore').text
            )
            # Check if the 'Astronaut Died' text is present
            is_game_over = "𐠒 Astronaut Died 𐠒" in final_score_text
            print(f"Game Over Detected: {is_game_over}")
            return is_game_over
        except TimeoutException:
            print("Timeout while checking for game over.")
            return False
        except Exception as e:
            print(f"Error checking game over status: {e}")
            return False


    def reset(self):
        try:
            # Check if the necessary JavaScript functions are available
            if not self.driver.execute_script("return typeof resetGame === 'function' && typeof startGame === 'function';"):
                print("resetGame or startGame functions are not defined. Please check your JavaScript implementation.")
                return np.array([0.0])

            # Call resetGame and startGame to ensure the game is in a known state
            self.driver.execute_script("resetGame(); startGame();")

            # Wait for the astronaut to ensure the game has restarted
            WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.ID, 'astronaut')))

            # Obtain astronaut's style attribute to get initial position
            astronaut = self.driver.find_element(By.ID, 'astronaut')
            astronaut_style = astronaut.get_attribute('style')

            # Return the initial position of the astronaut
            return np.array([self.parse_position(astronaut_style)])
        except Exception as e:
            print(f"An error occurred during reset: {str(e)}")
            return np.array([0.0])




    def parse_position(self, style):
        try:
            position_info = next(s for s in style.split(';') if 'left' in s)
            return float(position_info.split(':')[1].replace('px', '').strip())
        except Exception as e:
            print(f"Failed to parse astronaut position from style: '{style}'. Error: {e}")
            return 0.0

    def render(self, mode='human', close=False):
        pass

    def close(self):
        self.driver.quit()

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
