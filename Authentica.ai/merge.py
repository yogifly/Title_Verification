import pandas as pd
import glob

# Folder path where your 6 csv files are located
folder_path = './Data/'  # <-- change this if your files are elsewhere

# Get list of all CSV files in the folder
csv_files = glob.glob(folder_path + '*.csv')

# Columns you want to keep
columns_to_keep = [
    'Title-Code',
    'Title Name',
    'Owner Name',
    'State',
    'Publication City/District',
]

# List to store DataFrames
dataframes = []

for file in csv_files:
    # Read each CSV file
    df = pd.read_csv(file)
    
    # Keep only required columns (skip missing ones if any)
    df = df[[col for col in columns_to_keep if col in df.columns]]
    
    # Add to the list
    dataframes.append(df)

# Concatenate all DataFrames
merged_df = pd.concat(dataframes, ignore_index=True)

# Save the merged data to a new CSV file
merged_df.to_csv('Titles.csv', index=False)

print("Merging completed! Output saved as 'merged_output.csv'.")
