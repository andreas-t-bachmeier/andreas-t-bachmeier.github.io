import wandb
from stable_baselines3 import DQN
from stable_baselines3.common.vec_env import DummyVecEnv
from Gym_CosmicVoyager import CosmicVoyageEnv

def main():
    # Initialize WandB
    wandb.init(project='Cosmic Voyager RL', entity='AndiB1293', config={
        "learning_rate": 1e-4,
        "batch_size": 32,
        "architecture": "DQN",
        "policy_layers": [256, 256],
        "total_timesteps": 100000
    })

    # Create the environment
    env = DummyVecEnv([lambda: CosmicVoyageEnv()])

    # Initialize the model with WandB configuration
    model = DQN("MlpPolicy", env, verbose=1, tensorboard_log=None,
                buffer_size=10000,
                learning_rate=wandb.config.learning_rate,
                batch_size=wandb.config.batch_size,
                optimize_memory_usage=False,
                policy_kwargs=dict(net_arch=wandb.config.policy_layers),
                device='cuda')

    # Wrap the model training with WandB logging
    model.learn(total_timesteps=wandb.config.total_timesteps, callback=wandb_callback())

    # Save the model
    model.save("cosmic_voyage_dqn")

    # Close the environment
    env.close()

    # Sync WandB data and finish the run
    wandb.finish()

def wandb_callback():
    def callback(_locals, _globals):
        try:
            # Log metrics every 1000 steps
            if _locals['self'].num_timesteps % 1000 == 0:
                wandb.log({"loss": _locals['loss'], "reward": _locals['reward']})
        except Exception as e:
            print(f"Error in WandB callback: {e}")
        return True  # Important: Returning True ensures training continues even if logging fails
    return callback

if __name__ == '__main__':
    main()
