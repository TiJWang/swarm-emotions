import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import confusion_matrix
import seaborn as sns

# 定义真实情绪标签和预测标签
true_labels = [
    ['H'] * 20,  # happiness
    ['S'] * 20,  # sadness
    ['H'] * 20,  # happiness
    ['A'] * 20,  # angry
    ['F'] * 20,  # fear
    ['S'] * 20,  # sadness
    ['A'] * 20,  # angry
    ['S'] * 20,  # sadness
    ['S'] * 20,  # sadness
    ['F'] * 20,  # fear
    ['H'] * 20,  # happiness
    ['H'] * 20,  # happiness
    ['S'] * 20,  # sadness
    ['A'] * 20,  # angry
    ['F'] * 20,  # fear
    ['F'] * 20,  # fear
    ['A'] * 20,  # angry
    ['A'] * 20,  # angry
    ['F'] * 20,  # fear
    ['H'] * 20,  # happiness
    ['A'] * 20,  # angry
    ['F'] * 20,  # fear
    ['S'] * 20,  # sadness
    ['H'] * 20,  # happiness
    ['A'] * 20,  # angry
    ['F'] * 20,  # fear
    ['S'] * 20,  # sadness
    ['H'] * 20,  # happiness
]

predicted_labels = [
    list('HHFHFHHFHFHHHHHFAHFH'),
    list('SFFSSSSSSSFFFFSSSFFSS'),
    list('HHHFAHAFHHAHHAHHHHHF'),
    list('AAAFAFAHHAHHAAHAHAFF'),
    list('FFAAFAHHAHAAAFFFHFSA'),
    list('SSSSSSSSSSSSSSSSSSSS'),
    list('AAAFHAFAHAHAFAAAAHAA'),
    list('SFSFSSSSSSSSSSSSSSFS'),
    list('SSSSSSSSSSSSSSSSSHSS'),
    list('FHFFHFFFHHSFFHFHFFHF'),
    list('AHHHHHHFFFFAHHAHHHHF'),
    list('HHHHHHHHSAAHHHHHHHAH'),
    list('FFHFFFHHAHFSHFHFFHHS'),
    list('AAAAAAFAAAHAAAAAAAAA'),
    list('FFHFFAAHHSSFAAHFFFAF'),
    list('FFFFFAHFAHFHFFFHFFFA'),
    list('AAFFFHFAFFHFFFFFAAAA'),
    list('AAHFAHFAHAAAAHAAAHAA'),
    list('ASHHHHFAHHHAAHHHFAHA'),
    list('SFHSSFHHHSSHSSSHHSHF'),
    list('FAAAAAFAAAFAAAAAFAAA'),
    list('FFFSFFSSFFSFFFFFSFFF'),
    list('SSSSSSSSSSSSSSSSSSSS'),
    list('AHHHFHHHHHHHHHHHHAHF'),
    list('HHAAFAAAHAHAHHHHHHHA'),
    list('FFFFFFFFFSFFFFFFFSFF'),
    list('SSSSSSSFSSSHSSSSSSSS'),
    list('SHHHHHHHSSHHHHHHHHSH')
]

# 将标签列表扁平化处理，便于计算混淆矩阵
true_flat = [label for sublist in true_labels for label in sublist]
predicted_flat = [label for sublist in predicted_labels for label in sublist]

# 计算混淆矩阵
labels = ['H', 'S', 'F', 'A']
cm = confusion_matrix(true_flat, predicted_flat, labels=labels)

# 绘制混淆矩阵图
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=labels, yticklabels=labels)
plt.xlabel('预测标签')
plt.ylabel('真实标签')
plt.title('情绪分类混淆矩阵')
plt.show()
