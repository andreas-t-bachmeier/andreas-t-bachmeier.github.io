import wandb
import os
from stable_baselines3 import DQN
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.callbacks import BaseCallback
from Gym_CosmicVoyager import CosmicVoyageEnv  # Ensure this is your updated environment
import numpy as np

# Define a custom callback for logging additional metrics
from stable_baselines3.common.callbacks import BaseCallback

    # Specify the directory where you want to save the model
save_dir = r'C:\Users\Andy\Documents\GitHub\RL-Training_CosmicVoyager'
    # Change the current working directory to save_dir
os.chdir(save_dir)
    # Optionally, print the current directory to confirm the change
print("Current directory:", os.getcwd())

#######################

import wandb
wandb.login(key="805da8dbccda9e7dd5a0743e6219a4495d80b380")


# Initialize WandB
wandb.init(project='Cosmic Voyager RL', entity='AndiB1293', config={
    "learning_rate": 5e-4,
    "batch_size": 512,
    "architecture": "DQN",
    "policy_layers": [256, 256, 256, 256, 256, 256],  # architecture
    "total_timesteps": 10000,
    "exploration_initial_eps": 1.0,
    "exploration_final_eps": 0.2,
    "exploration_fraction": 0.6
})

# Create and wrap the environment in a DummyVecEnv for vectorized operation
env = DummyVecEnv([lambda: CosmicVoyageEnv()])

# Initialize the DQN model with configuration from WandB
model = DQN("MlpPolicy", env, verbose=1, tensorboard_log=None,
            buffer_size=10000,
            learning_rate=wandb.config.learning_rate,
            batch_size=wandb.config.batch_size,
            optimize_memory_usage=False,
            policy_kwargs=dict(net_arch=wandb.config.policy_layers),
            device='cuda',
            exploration_initial_eps=wandb.config.exploration_initial_eps,
            exploration_final_eps=wandb.config.exploration_final_eps,
            exploration_fraction=wandb.config.exploration_fraction)


# Define a custom callback for logging additional metrics
class CustomRLCallback(BaseCallback):
    def __init__(self, verbose=0):
        super().__init__(verbose)
        self.episode_rewards = []
        self.total_rewards = 0
        self.episode_lengths = []
        self.total_steps = 0
        self.action_counts = None  # Initialized later

    def _on_step(self) -> bool:
        if self.action_counts is None:
            # Initialize action counts array now that model is available
            self.action_counts = np.zeros(self.model.action_space.n, dtype=int)

        self.total_rewards += self.locals["rewards"][0]  # Sum rewards, assuming a single environment
        self.total_steps += 1
        action = self.locals['actions'][0]
        self.action_counts[action] += 1  # Update action counts

        # Print observation every 10th timestep
        if self.num_timesteps % 10 == 0:
            # Directly access the last observation stored after the last environment step
            current_observation = self.training_env.envs[0].get_last_observation()
            current_score = self.locals['rewards'][0]
            print(f"Step {self.num_timesteps}: Observation - {current_observation}, Score - {current_score}")

        if self.locals["dones"][0]:  # Check if the episode is done
            # Log metrics at the end of each episode
            self.episode_rewards.append(self.total_rewards)
            self.episode_lengths.append(self.total_steps)
            action_distribution = {f"Action {i}": count for i, count in enumerate(self.action_counts)}
            if len(self.episode_rewards) % 10 == 0:  # Log every 10 episodes
                wandb.log({
                    "Cumulative Reward per Episode": self.total_rewards,
                    "Average Reward per Episode": sum(self.episode_rewards) / len(self.episode_rewards),
                    "Length of Each Episode": self.total_steps,
                    "Exploration Rate": self.model.exploration_rate,
                    "Episode Action Distribution": action_distribution
                })

            # Reset counters for next episode
            self.total_rewards = 0
            self.total_steps = 0
            self.action_counts.fill(0)  # Reset action counts for the next episode

        return True



    def _on_training_end(self):
        # This function can log final summaries or cleanup
        print("Training completed!")


# Initialize the callback
callback = CustomRLCallback()

# Start training
model.learn(total_timesteps=wandb.config.total_timesteps, callback=callback)

# Save the model
model.save("cosmic_voyage_dqn")

# Close the environment
env.close()

# Sync WandB data and finish the run
wandb.finish()
