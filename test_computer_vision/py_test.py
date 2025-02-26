import cv2
import sys
import os
os.environ["QT_QPA_PLATFORM"] = "xcb"

def main():
    # 1. Read the input image
    image = cv2.imread("example.jpg")
    if image is None:
        print("Error: Could not open or find the image!")
        sys.exit(1)
    print("#1 DONE")
    # OpenCV in Python stores images as NumPy arrays with shape (height, width, channels).
    # So image.shape is (rows, cols, channels).
    # image.shape[1] = width, image.shape[0] = height
    print(f"Original image size: {image.shape[1]} x {image.shape[0]}")
    width_quarter: int = image.shape[1]/3
    height_quarter: int = image.shape[0]/3
    # 2. Define crop region (x, y, width, height)
    x = width_quarter
    y = height_quarter
    width = width_quarter*3
    height = height_quarter*3
    print("#2 DONE")
    # Make sure the crop region fits in the original image
    if x + width > image.shape[1]:
        width = image.shape[1] - x
    if y + height > image.shape[0]:
        height = image.shape[0] - y
    print("#2.5 DONE")
    
    # 3. Crop the image (Note: in Python, slicing order is [row, col] => [y, x])
    cropped_image = image[int(y):int(height), int(x):int(width)]
    print(f"Cropped image size: {cropped_image.shape[1]} x {cropped_image.shape[0]}")#needs fixing
    print("#3 DONE")

    # 4. Resize cropped image
    # new_width, new_height = 128, 128
    # resized_image = cv2.resize(cropped_image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
    # print(f"Resized image size: {resized_image.shape[1]} x {resized_image.shape[0]}")
    print("#4 Skipped")

    # 5. Display the final image
    cv2.imshow("Cropped & Resized Image", cropped_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    print("#5 DONE")

    # 6. Save to disk (optional)
    cv2.imwrite("output.jpg", cropped_image)
    print("#6 DONE")
if __name__ == "__main__":
    main()
