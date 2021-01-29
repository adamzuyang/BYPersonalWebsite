import os

list_of_files = os.listdir()

for file_name in list_of_files:
    if file_name[-4:-1] == "htm":
        os.rename(file_name, file_name[:9] + ".ejs")