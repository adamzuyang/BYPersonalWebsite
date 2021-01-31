import os

list_of_files = os.listdir()

for file_name in list_of_files:
    if file_name[-3:] == "ejs":
        os.rename(file_name, file_name[:9] + ".html")