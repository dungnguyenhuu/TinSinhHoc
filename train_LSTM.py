from Bio import SeqIO
from sklearn.model_selection import train_test_split
import numpy as np
def getString(filename):
    f = []
    for rec in SeqIO.parse(filename, "fasta"):
        f.append(str(rec.seq))
    return f

Xp = getString('PaCRISPR_Training_Positive_Original_488.fasta')
Xn = getString('PaCRISPR_Training_Negative_902.fasta')
X = Xp + Xn
yp = [1] * len(Xp)
yn = [-1] * len(Xn)
y = yp + yn

# print(X, y)

X_train, X_test_val, y_train, y_test_val = train_test_split(X, y, test_size=.2, random_state=1)
X_test, X_val, y_test, y_val = train_test_split(X_test_val, y_test_val, test_size=.5, random_state=1)

codes = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L',
         'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y']

def create_dict(codes):
  char_dict = {}
  for index, val in enumerate(codes):
    char_dict[val] = index+1

  return char_dict

char_dict = create_dict(codes)

print(char_dict)
print("Dict Length:", len(char_dict))

def integer_encoding(data):
  """
  - Encodes code sequence to integer values.
  - 20 common amino acids are taken into consideration
    and rest 4 are categorized as 0.
  """
  
  encode_list = []
  for row in data:
    row_encode = []
    for code in row:
      row_encode.append(char_dict.get(code, 0))
    encode_list.append(np.array(row_encode))
  
  return encode_list
  
train_encode = integer_encoding(X_train) 
val_encode = integer_encoding(X_val)
test_encode = integer_encoding(X_test)

# print(train_encode)
from keras.preprocessing.sequence import pad_sequences

max_length = 100
train_pad = pad_sequences(X_train, maxlen=max_length, padding='post', truncating='post')
val_pad = pad_sequences(X_val, maxlen=max_length, padding='post', truncating='post')
test_pad = pad_sequences(X_test, maxlen=max_length, padding='post', truncating='post')

print(train_pad.shape, val_pad.shape, test_pad.shape)

from keras.utils import to_categorical

# One hot encoding of sequences
train_ohe = to_categorical(train_pad)
val_ohe = to_categorical(val_pad)
test_ohe = to_categorical(test_pad)

print(train_ohe.shape, val_ohe.shape, test_ohe.shape)

# Model
x_input = Input(shape=(100,))
emb = Embedding(21, 128, input_length=max_length)(x_input)
bi_rnn = Bidirectional(CuDNNLSTM(64, kernel_regularizer=l2(0.01), recurrent_regularizer=l2(0.01), bias_regularizer=l2(0.01)))(emb)
x = Dropout(0.3)(bi_rnn)

# softmax classifier
x_output = Dense(1000, activation='softmax')(x)

model1 = Model(inputs=x_input, outputs=x_output)
model1.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])