# https://dmnfarrell.github.io/bioinformatics/mhclearning
# http://www.cryst.bbk.ac.uk/education/AminoAcid/the_twenty.html
# 1 letter code for 20 natural amino acids

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
  for row in data['sequence'].values:
    row_encode = []
    for code in row:
      row_encode.append(char_dict.get(code, 0))
    encode_list.append(np.array(row_encode))
  
  return encode_list
  
train_encode = integer_encoding(train_sm) 
val_encode = integer_encoding(val_sm) 
test_encode = integer_encoding(test_sm) 

# from kears.preprocessing.sequence import pad_sequences

# max_length = 100
# train_pad = pad_sequences(train_encode, maxlen=max_length, padding='post', truncating='post')
# val_pad = pad_sequences(val_encode, maxlen=max_length, padding='post', truncating='post')
# test_pad = pad_sequences(test_encode, maxlen=max_length, padding='post', truncating='post')

# print(train_pad.shape, val_pad.shape, test_pad.shape)

# from keras.utils import to_categorical

# # One hot encoding of sequences
# train_ohe = to_categorical(train_pad)
# val_ohe = to_categorical(val_pad)
# test_ohe = to_categorical(test_pad)

# print(train_ohe.shape, val_ohe.shape, test_ohe.shape) 
# ###
# x_input = Input(shape=(100,))
# emb = Embedding(21, 128, input_length=max_length)(x_input)
# bi_rnn = Bidirectional(CuDNNLSTM(64, kernel_regularizer=l2(0.01), recurrent_regularizer=l2(0.01), bias_regularizer=l2(0.01)))(emb)
# x = Dropout(0.3)(bi_rnn)

# # softmax classifier
# x_output = Dense(1000, activation='softmax')(x)

# model1 = Model(inputs=x_input, outputs=x_output)
# model1.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])