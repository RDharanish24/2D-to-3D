from rembg import remove, new_session
from PIL import Image
import io

_session = None


def _get_session():
    global _session
    if _session is None:
        _session = new_session("u2net")
    return _session


def remove_background(input_path: str, output_path: str) -> None:
    with open(input_path, "rb") as f:
        input_data = f.read()

    output_data = remove(
        input_data,
        session=_get_session(),
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    img = Image.open(io.BytesIO(output_data)).convert("RGBA")

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    canvas_size = int(max(img.size) / 0.8 + 0.5)
    square = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset = ((canvas_size - img.width) // 2, (canvas_size - img.height) // 2)
    square.paste(img, offset, img)

    bg = Image.new("RGB", square.size, (255, 255, 255))
    bg.paste(square, mask=square.split()[3])
    bg.save(output_path, "PNG")
