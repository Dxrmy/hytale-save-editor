import struct
import os

def read_at_offset(file_path, offset, size=64):
    with open(file_path, "rb") as f:
        f.seek(offset)
        data = f.read(size)
        print(f"Data at offset {offset} (hex):")
        print(data.hex(' '))
        try:
            print(f"ASCII: {data.decode('ascii', errors='ignore')}")
        except:
            pass

if __name__ == "__main__":
    path = r"C:\Users\kmric\AppData\Roaming\Hytale\UserData\Saves\Orbis Origin\universe\worlds\default\chunks\1.0.region.bin"
    # Try offset 343 (Entry 0)
    read_at_offset(path, 343)
    # Try offset 3661 (Entry 1)
    read_at_offset(path, 3661)
