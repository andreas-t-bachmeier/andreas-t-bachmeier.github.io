import logging
from stable_baselines3 import DQN
from stable_baselines3.common.vec_env import DummyVecEnv
from Gym_CosmicVoyager import CosmicVoyageEnv  # Import the custom environment

logging.basicConfig(level=logging.INFO)

def main():
    try:
        # Create the environment
        env = DummyVecEnv([lambda: CosmicVoyageEnv()])  # Using DummyVecEnv for single process

        # Initialize the agent
        model = DQN("MlpPolicy", env, verbose=1,
                    buffer_size=10000,
                    learning_rate=1e-4,
                    batch_size=32,
                    optimize_memory_usage=False,
                    policy_kwargs=dict(net_arch=[256, 256]),
                    device='cuda',
                    tensorboard_log="./tensorboard_logs/")

        # Train the model
        model.learn(total_timesteps=500000)

        # Save the model
        model.save("cosmic_voyage_dqn")
        env.close()

        print("Training completed and model saved!")
    except Exception as e:
        logging.exception("An error occurred during training:")
        raise

if __name__ == '__main__':
    main()
