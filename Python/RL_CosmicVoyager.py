import gym
from gym import spaces
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import numpy as np

class CosmicVoyageEnv(gym.Env):
    """Custom Environment that follows gym interface"""
    metadata = {'render.modes': ['human']}

    def __init__(self):
        super(CosmicVoyageEnv, self).__init__()
        # Initialize Selenium WebDriver
        self.driver = webdriver.Chrome(executable_path='C:\Users\Andy\Documents\GitHub\chromedriver_win32\chromedriver.exe')
        self.driver.get('file:///C:/Users/Andy/Documents/GitHub/andreas-t-bachmeier.github.io/CosmicVoyage.html')  # URL to your game

        # Define action space and observation space
        self.action_space = spaces.Discrete(3)  # 0: stay, 1: move left, 2: move right
        self.observation_space = spaces.Box(low=np.array([0]), high=np.array([np.inf]), dtype=np.float32)

    def step(self, action):
        # Map the action to game controls
        if action == 1:
            self.driver.find_element_by_tag_name('body').send_keys(Keys.ARROW_LEFT)
        elif action == 2:
            self.driver.find_element_by_tag_name('body').send_keys(Keys.ARROW_RIGHT)
        
        # Retrieve game state
        score = float(self.driver.find_element_by_id('score').text.split(' ')[1])  # Adjust if your score format differs
        astronaut_position = float(self.driver.find_element_by_id('astronaut').value_of_css_property('left').split('px')[0])
        done = 'Game Over' in self.driver.page_source  # Check if game over text appears

        # Define reward: here simply using the score as the reward
        reward = score

        # Prepare the observation
        observation = np.array([astronaut_position, score])
        return observation, reward, done, {}

    def reset(self):
        # Restart the game
        self.driver.refresh()
        self.driver.find_element_by_id('startButton').click()  # Assuming your game has a start button

        # Return initial state
        astronaut_position = float(self.driver.find_element_by_id('astronaut').value_of_css_property('left').split('px')[0])
        score = 0.0
        return np.array([astronaut_position, score])

    def render(self, mode='human'):
        # Currently, rendering is done by the game itself
        pass

    def close(self):
        self.driver.quit()

        
#Test Environment
env = CosmicVoyageEnv()
observation = env.reset()
for _ in range(100):
    action = env.action_space.sample()
    observation, reward, done, info = env.step(action)
    print(f"Obs: {observation}, Reward: {reward}, Done: {done}")
    if done:
        observation = env.reset()
env.close()
