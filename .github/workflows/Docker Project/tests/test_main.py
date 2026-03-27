import shutil
from pathlib import Path
import unittest

from main import generate_qr_code, resolve_output_path


class QRGeneratorTests(unittest.TestCase):
    def test_generate_qr_code_creates_png(self) -> None:
        temp_root = Path("tests_output")
        try:
            shutil.rmtree(temp_root, ignore_errors=True)
            temp_root.mkdir(parents=True, exist_ok=True)
            qr_dir = temp_root / "qr_codes"
            qr_dir.mkdir(parents=True, exist_ok=True)
            output_path = resolve_output_path("https://www.njit.edu", None, qr_dir)

            generate_qr_code(
                url="https://www.njit.edu",
                output_path=output_path,
                error_correction="M",
                box_size=10,
                border=4,
            )

            self.assertTrue(output_path.exists())
            self.assertEqual(output_path.suffix, ".png")
        finally:
            shutil.rmtree(temp_root, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
