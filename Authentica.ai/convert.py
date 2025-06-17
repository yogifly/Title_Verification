import json
import pandas as pd

# Path to your JSON file
json_file_path = 'data4.json'
csv_file_path = 'title(4).csv'

# Load the JSON file
with open(json_file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Flatten the JSON structure into a single list
records = []
for key, value in data.items():
    if isinstance(value, list):
        records.extend(value)

# Convert to DataFrame
df = pd.DataFrame(records)

# Replace NaN with empty strings (to clean up missing fields)
df.fillna('', inplace=True)

# Save to CSV
df.to_csv(csv_file_path, index=False, encoding='utf-8')

print(f"✅ Conversion complete. CSV saved to: {csv_file_path}")
