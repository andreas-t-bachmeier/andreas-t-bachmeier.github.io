import wandb

# Manually set the API key
wandb.login(key='805da8dbccda9e7dd5a0743e6219a4495d80b380')

# Example usage
wandb.init(project='my_project')
wandb.log({'example_metric': 10})
wandb.finish()
