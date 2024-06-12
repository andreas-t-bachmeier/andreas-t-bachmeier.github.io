import gym
from gym import spaces
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import numpy as np

class CosmicVoyageEnv(gym.Env):
    metadata = {'render.modes': ['human']}

    def __init__(self):
        super(CosmicVoyageEnv, self).__init__()
        service = Service(executable_path=r'C:\Users\Andy\Documents\GitHub\chromedriver-win64\chromedriver.exe')
        self.driver = webdriver.Chrome(service=service)
        self.driver.get('https://andreas-t-bachmeier.github.io/CosmicVoyage.html')

        self.driver.maximize_window()

        self.action_space = spaces.Discrete(3)  # Actions: stay, move left, move right
        self.observation_space = spaces.Box(low=0, high=np.inf, shape=(1,), dtype=np.float32)
        
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

        done = 'Game Over' in self.driver.page_source

        return np.array([astronaut_position]), score, done, {}
#############Reset

    def reset(self):
        try:
            self.driver.refresh()  # Refresh the page to reset the game
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, 'gameArea'))
            )

            # Handling both the start and restart scenarios
            start_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, 'startButton'))
            )
            button_text = start_button.text
            start_button.click()
            print(f"Clicked {'restart' if 'Restart' in button_text else 'start'} button.")

            # Ensure astronaut is present and obtain its position
            astronaut = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, 'astronaut'))
            )
            astronaut_style = astronaut.get_attribute('style')
            return np.array([self.parse_position(astronaut_style)])

        except Exception as e:
            print(f"An error occurred during reset: {str(e)}")
            # Optionally, return a default state or raise an exception to stop training
            return np.array([0.0])  # This is an example, adjust according to your needs

    def parse_position(self, style):
        try:
            position_info = next(s for s in style.split(';') if 'left' in s)
            return float(position_info.split(':')[1].replace('px', '').strip())
        except Exception as e:
            print(f"Failed to parse astronaut position from style: '{style}'. Error: {e}")
            return 0.0  # Return a default position in case of an error


    
###################
    def render(self, mode='human', close=False):
        pass

    def close(self):
        self.driver.quit()

# Test the environment
if __name__ == "__main__":
    env = CosmicVoyageEnv()
    for _ in range(100):
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)
        print(f"Observation: {obs}, Reward: {reward}, Done: {done}")
        if done:
            env.reset()
            print("Game over - Resetting")
    env.close()
