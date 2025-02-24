#include <iostream>
#include <opencv2/opencv.hpp>
#include <opencv2/core.hpp>
#include <opencv2/opencv_modules.hpp>
#include <opencv2/imgcodecs.hpp>
#include "opencv2/imgcodecs.hpp"
#include "opencv2/highgui.hpp"

int main() {
    // 1. Read the input image
    cv::Mat image = cv::imread("example.jpg");
    if (image.empty()) {
        std::cerr << "Error: Could not open or find the image!\n";
        return -1;
    }
    std::cout << "Original image size: " << image.cols << " x " << image.rows << std::endl;

    // 2. Define crop region (x, y, width, height)
    int x      = 50;
    int y      = 50;
    int width  = 200;
    int height = 150;

    // Make sure the crop region fits in the original image
    if (x + width  > image.cols) width  = image.cols - x;
    if (y + height > image.rows) height = image.rows - y;

    cv::Rect cropRegion(x, y, width, height);

    // 3. Crop the image
    cv::Mat croppedImage = image(cropRegion);
    std::cout << "Cropped image size: " 
              << croppedImage.cols << " x " << croppedImage.rows << std::endl;

    // 4. Resize the cropped image
    int newWidth  = 128;
    int newHeight = 128;
    cv::Mat resizedImage;
    cv::resize(croppedImage, resizedImage, cv::Size(newWidth, newHeight), 0, 0, cv::INTER_LINEAR);

    std::cout << "Resized image size: " 
              << resizedImage.cols << " x " << resizedImage.rows << std::endl;

    // 5. Display the final image
    cv::imshow("Cropped & Resized Image", resizedImage);
    cv::waitKey(0);

    // 6. Save to disk (optional)
    cv::imwrite("output.jpg", resizedImage);

    return 0;
}
