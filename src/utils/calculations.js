export function getSegmentsPerLine(maxSegments, levelOfDetail) {
  let meshSimplificationIncrement = levelOfDetail * 2;

  if (meshSimplificationIncrement == 0) {
    meshSimplificationIncrement = 1;
  }

  const segmentsPerLine = maxSegments / meshSimplificationIncrement;

  return { meshSimplificationIncrement, segmentsPerLine };
}
