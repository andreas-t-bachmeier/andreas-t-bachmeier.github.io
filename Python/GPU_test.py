#import torch

#print(torch.cuda.is_available())  # Should return True if CUDA is available
#print(torch.cuda.get_device_name(0))  # Should return the name of your GPU

#import os
#print(os.getcwd())

# import tensorflow as tf

# if tf.test.is_built_with_cuda():
#     print("TensorFlow successfully built with CUDA")
# else:
#     print("TensorFlow was not built with CUDA")

# gpus = tf.config.list_physical_devices('GPU')
# print("Num GPUs Available: ", len(gpus))
# for gpu in gpus:
#     print("GPU:", gpu)

# if tf.test.gpu_device_name():
#     print('Default GPU Device: {}'.format(tf.test.gpu_device_name()))
# else:
#     print("Failed to detect the GPU with TensorFlow")


import torch
print(torch.cuda.is_available())
