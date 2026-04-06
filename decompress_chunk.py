import struct
import os
import zstandard as zstd

def decompress_chunk(file_path, sector, comp_len, uncomp_len):
    offset = sector * 4096 + 40
    with open(file_path, "rb") as f:
        f.seek(offset)
        compressed = f.read(comp_len)
        
        print(f"Compressed size: {len(compressed)}, Uncompressed size: {uncomp_len}")
        dctx = zstd.ZstdDecompressor()
        try:
            uncompressed = dctx.decompress(compressed, max_output_size=uncomp_len + 1024)
            print(f"Successfully decompressed {len(uncompressed)} bytes.")
            print("First 128 bytes (hex):")
            print(uncompressed[:128].hex(' '))
            print("ASCII:")
            print(uncompressed[:128].decode('ascii', errors='ignore'))
            
            # Save for inspection
            with open("chunk_data.bin", "wb") as out:
                out.write(uncompressed)
                print("Saved to chunk_data.bin")
        except Exception as e:
            print(f"Decompression failed: {e}")

if __name__ == "__main__":
    path = r"C:\Users\kmric\AppData\Roaming\Hytale\UserData\Saves\Orbis Origin\universe\worlds\default\chunks\1.0.region.bin"
    # Entry 0: 343
    # comp_len = 0x4263 (16995), uncomp_len = 0x4de86 (319110)
    decompress_chunk(path, 343, 16995, 319110)
