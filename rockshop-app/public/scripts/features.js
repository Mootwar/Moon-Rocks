// features.js
const cv = require('opencv4nodejs');

 // Extract a color‐histogram feature vector from an image file.
function extractColorHistogram(imagePath) {
  const src = cv.imread(imagePath);
  // Hue Saturation Value
  const hsv = src.cvtColor(cv.COLOR_BGR2HSV);

  // e.g.  8 bins for H, 12 for S, 3 for V  → total 8*12*3 = 288‐dim vector
  // Convertion from BRG to HSV for better accuracy
  const hist = cv.calcHist( // Computes a 3D histogram
    hsv.splitChannels(), // Array of single channel mats = [H S V]
    [0, 1, 2],
    new cv.Mat(),  // no mask
    [8, 12, 3],  // bin counts per channel
    [0, 180, 0, 256, 0, 256] //Ranges per channel
  );
  // normalize to sum = 1
  return hist
    .normalize(1)    // L1 norm
    .getDataAsArray() // 3d array
    .flat();          // flatten to a single 288 vector
}

 // Extract an ORB keypoint descriptor vector.
function extractORBDescriptor(imagePath, maxFeatures = 500) {
    // Convert to grey scale
    const src = cv.imread(imagePath).bgrToGray();
    //init an ORB detector to find max features keypoints
    const orb = new cv.ORBDetector({ nFeatures: maxFeatures });
    // detect keypoints in corners or blobs in the image
    const keypoints = orb.detect(src);
    //compute a 32 byte descriptor for each keypoint
    const descriptors = orb.compute(src, keypoints);
    // turn the descriptors Mat into a flat JS array
    let arr = descriptors.getDataAsArray().flat();
    // enforce a fixed length by padding with zeros or slicing
    const desired = maxFeatures * 32;
    if (arr.length < desired) {
    arr = arr.concat(Array(desired - arr.length).fill(0)); // pad
    } else if (arr.length > desired) {
    arr = arr.slice(0, desired);                          // truncate
    }

    return arr;  // length = maxFeatures×32
}

function extractCombinedFeatures(imagePath) {
  // Get the normalized HSV histogram (length 288)
  const colorVec = extractColorHistogram(imagePath);

  // Get the ORB descriptor vector (length = 500×32 = 16,000)
  const orbVec   = extractORBDescriptor(imagePath, 500);

  // Optionally weight color features more heavily
  const colorWeight = 2.0;
  const scaledColor = colorVec.map(v => v * colorWeight);

  // Concatenate into one big vector [288 + 16000 = 16288]
  return scaledColor.concat(orbVec);
}

// calculate euclideandistance
function euclideanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error('Feature‐vector length mismatch');
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

module.exports = {
  extractColorHistogram,
  extractORBDescriptor,
  extractCombinedFeatures,
  euclideanDistance
};
