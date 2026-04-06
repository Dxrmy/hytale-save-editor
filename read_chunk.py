import struct
import os

def get_chunk_data(file_path, chunk_x, chunk_z):
    with open(file_path, "rb") as f:
        f.seek(20) # Magic
        header = f.read(12)
        version, entries, chunk_size = struct.unpack(">III", header)
        
        index = (chunk_x % 32) + (chunk_z % 32) * 32
        f.seek(32 + index * 8)
        offset, length = struct.unpack(">II", f.read(8))
        print(f"Chunk {chunk_x},{chunk_z} in {os.path.basename(file_path)}: Offset {offset}, Length {length}")
        
        if offset == 0:
            print("Chunk not found (offset 0).")
            return
        
        f.seek(offset)
        data = f.read(length)
        print(f"First 32 bytes of data (hex): {data[:32].hex(' ')}")
        return data

if __name__ == "__main__":
    # Local chunk 21, 19
    path = r"C:\Users\kmric\AppData\Roaming\Hytale\UserData\Saves\Orbis Origin\universe\worlds\default\chunks\1.0.region.bin"
    get_chunk_data(path, 53, 19)
