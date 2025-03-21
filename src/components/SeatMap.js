import React from 'react';
import images from '../constants/images';

const SeatMap = ({ balconyData, juriesData, onSeatClick, scalingFactor = 0.71, cart }) => {
  const originalFirstRowPositions = {
    left: [
      { x: -353.38, y: -129.73 },
      { x: -335.14, y: -147.97 },
      { x: -316.89, y: -164.19 },
      { x: -297.30, y: -180.41 },
      { x: -277.70, y: -194.59 },
      { x: -257.43, y: -208.11 },
    ],
    middle: [
      { x: -165.41, y: -254.05 },
      { x: -140.54, y: -261.49 },
      { x: -115.88, y: -268.24 },
      { x: -89.46, y: -273.65 },
      { x: -64.19, y: -277.70 },
      { x: -38.38, y: -279.05 },
      { x: -12.91, y: -279.73 },
      { x: 27.91, y: -278.38 },
      { x: 53.72, y: -276.01 },
      { x: 78.72, y: -271.62 },
      { x: 104.73, y: -265.54 },
      { x: 129.39, y: -257.43 },
      { x: 154.05, y: -249.32 },
    ],
    right: [
      { x: 244.19, y: -200.68 },
      { x: 264.19, y: -186.15 },
      { x: 283.78, y: -171.62 },
      { x: 302.70, y: -155.41 },
      { x: 320.27, y: -136.49 },
      { x: 338.11, y: -118.92 },
    ],
  };

  const firstRowPositions = {
    left: originalFirstRowPositions.left.map(pos => ({
      x: pos.x * scalingFactor,
      y: pos.y * scalingFactor,
    })),
    middle: originalFirstRowPositions.middle.map(pos => ({
      x: pos.x * scalingFactor,
      y: pos.y * scalingFactor,
    })),
    right: originalFirstRowPositions.right.map(pos => ({
      x: pos.x * scalingFactor,
      y: pos.y * scalingFactor,
    })),
  };

  const getSeatImage = (available, pending, price) => {
    if (!available) return images.SeatIcon || '';
    if (pending) return images.SeatPending || images.SeatIcon || '';
    switch (price) {
      case 20:
        return images.SeatPurple || images.SeatRed || '';
      case 30:
        return images.SeatYellow || images.SeatRed || '';
      case 40:
        return images.SeatGreen || images.SeatRed || '';
      case 50:
        return images.SeatRed || '';
      default:
        return images.SeatRed || '';
    }
  };

  const adjustRotation = (section, rowIndex, seatIndex, baseAngle) => {
    return baseAngle + 180;
  };

  const generateSectionSeats = (section, rowIndex, sectionName, seatCount, price, availability, pending, startIndex, xOffset, yOffset, isJuries = false) => {
    console.log(`Generating seats for ${sectionName} ${section}, row ${rowIndex}, seatCount: ${seatCount}`);
    const seats = [];
    const seatWidth = 15;
    const seatHeight = 16;
    const spacing = isJuries ? 2 : 4;
    const stageCenterX = 528.62;
    const stageCenterY = 1274;

    const juriesTransformX = 532;
    const topY = firstRowPositions.middle[6].y;
    const juriesTransformY = 1071.35 - topY;
    const relativeStageCenterX = stageCenterX - juriesTransformX;
    const relativeStageCenterY = stageCenterY - juriesTransformY;

    const originalCircleCenterX = -12.50;
    const originalCircleCenterY = 181.28;
    const originalBaseRadius = 461.49;
    const originalRowSpacing1to7 = 50.00;
    const originalRowSpacing8to12 = 30.00;
    const originalGapAfterRow7 = 100.00;

    const circleCenterX = originalCircleCenterX * scalingFactor;
    const circleCenterY = originalCircleCenterY * scalingFactor;
    const baseRadius = originalBaseRadius * scalingFactor;
    const rowSpacing1to7 = originalRowSpacing1to7 * scalingFactor;
    const rowSpacing8to12 = originalRowSpacing8to12 * scalingFactor;
    const gapAfterRow7 = originalGapAfterRow7 * scalingFactor;

    for (let i = 0; i < seatCount; i++) {
      const seatIndex = startIndex + i;
      const available = availability[seatIndex];
      const isPending = pending[seatIndex];
      let seatPrice = price;
      if (Array.isArray(price)) {
        if (section === 'left') seatPrice = price[0];
        else if (section === 'middle') seatPrice = price[1];
        else if (section === 'right') seatPrice = price[2];
      }

      let x, y, rotationAngle;

      const seatId = sectionName === 'Juries'
        ? `${sectionName}-${section}-row${rowIndex}-seat${seatIndex}`
        : `${sectionName}-${section}-row${rowIndex}-seat${seatIndex}`;

      const isSelected = cart.some(item => item.id === seatId);

      if (isJuries) {
        if (rowIndex === 0) {
          const position = firstRowPositions[section][i];
          if (position) {
            x = position.x;
            y = position.y;
            const dx = relativeStageCenterX - x;
            const dy = relativeStageCenterY - y;
            rotationAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            rotationAngle = adjustRotation(section, rowIndex, i, rotationAngle);
          } else {
            x = 0;
            y = 0;
            rotationAngle = 0;
          }
        } else {
          let yOffsetAdjustment;
          if (rowIndex <= 6) {
            yOffsetAdjustment = rowIndex * rowSpacing1to7;
          } else {
            yOffsetAdjustment = (6 * rowSpacing1to7) + gapAfterRow7 + (rowIndex - 7) * rowSpacing8to12;
          }
          const radius = baseRadius + yOffsetAdjustment;

          const firstRowSection = firstRowPositions[section];
          const firstSeatX = firstRowSection[0].x;
          const lastSeatX = firstRowSection[firstRowSection.length - 1].x;
          const firstAngle = Math.atan2(firstRowSection[0].y - circleCenterY, firstSeatX - circleCenterX);
          const lastAngle = Math.atan2(firstRowSection[firstRowSection.length - 1].y - circleCenterY, lastSeatX - circleCenterX);
          const angleRange = lastAngle - firstAngle;
          const angleStep = seatCount > 1 ? angleRange / (seatCount - 1) : 0;
          const angle = firstAngle + i * angleStep;

          x = circleCenterX + radius * Math.cos(angle);
          y = circleCenterY + radius * Math.sin(angle);

          const dx = relativeStageCenterX - x;
          const dy = relativeStageCenterY - y;
          rotationAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
          rotationAngle = adjustRotation(section, rowIndex, i, rotationAngle);
        }

        const seatImage = getSeatImage(available, isPending, seatPrice);

        seats.push(
          <g key={seatId} transform={`translate(${x}, ${y}) rotate(${rotationAngle})`}>
            <image
              href={seatImage}
              x={-seatWidth / 2}
              y={-seatHeight / 2}
              width={seatWidth}
              height={seatHeight}
              className={`seat ${!available ? 'reserved' : ''} ${isPending ? 'pending' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSeatClick({
                id: seatId,
                price: seatPrice,
                section: sectionName,
                row: rowIndex + 1,
                seatNum: seatIndex + 1,
                available,
                pending: isPending,
              })}
            />
          </g>
        );
      } else {
        x = xOffset + i * (seatWidth + spacing);
        y = yOffset;

        const seatImage = getSeatImage(available, isPending, seatPrice);

        seats.push(
          <g key={seatId} transform={`translate(${x}, ${y})`}>
            <image
              href={seatImage}
              x={-seatWidth / 2}
              y={-seatHeight / 2}
              width={seatWidth}
              height={seatHeight}
              className={`seat ${!available ? 'reserved' : ''} ${isPending ? 'pending' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSeatClick({
                id: seatId,
                price: seatPrice,
                section: sectionName,
                row: rowIndex + 1,
                seatNum: seatIndex + 1,
                available,
                pending: isPending,
              })}
            />
          </g>
        );
      }
    }

    return seats;
  };

  const generateRow = (sectionName, rowIndex, rowData, yOffset, isJuries = false) => {
    if (!rowData || typeof rowData !== 'object') {
      console.error(`Invalid rowData for ${sectionName}, row ${rowIndex}:`, rowData);
      return null;
    }

    const { left, middle, right, price, availability, pending } = rowData;
    if (!left || !middle || !right || !price || !availability || !pending) {
      console.error(`Missing required properties in rowData for ${sectionName}, row ${rowIndex}:`, rowData);
      return null;
    }

    console.log(`Generating row for ${sectionName}, row ${rowIndex}:`, rowData);
    const seatWidth = 15;
    const spacing = isJuries ? 2 : 4;

    const totalSeats = left + middle + right;
    let startX, middleXOffset, rightXOffset;

    if (isJuries) {
      startX = 0;
      const middleStartIndex = left;
      const rightStartIndex = left + middle;

      return (
        <g key={`${sectionName}-row${rowIndex}`}>
          {generateSectionSeats('left', rowIndex, sectionName, left, price, availability, pending, 0, startX, yOffset, isJuries)}
          {generateSectionSeats('middle', rowIndex, sectionName, middle, price, availability, pending, middleStartIndex, 0, yOffset, isJuries)}
          {generateSectionSeats('right', rowIndex, sectionName, right, price, availability, pending, rightStartIndex, 0, yOffset, isJuries)}
        </g>
      );
    } else {
      const leftSectionWidth = left * (seatWidth + spacing) - spacing;
      const middleSectionWidth = middle * (seatWidth + spacing) - spacing;
      const rightSectionWidth = right * (seatWidth + spacing) - spacing;
      const fixedGap = 100;
      const totalWidthWithFixedGaps = leftSectionWidth + fixedGap + middleSectionWidth + fixedGap + rightSectionWidth;

      startX = -totalWidthWithFixedGaps / 2;
      middleXOffset = startX + leftSectionWidth + fixedGap;
      rightXOffset = middleXOffset + middleSectionWidth + fixedGap;

      const leftSeats = generateSectionSeats('left', rowIndex, sectionName, left, price, availability, pending, 0, startX, yOffset, isJuries);
      const middleStartIndex = left;
      const middleSeats = generateSectionSeats('middle', rowIndex, sectionName, middle, price, availability, pending, middleStartIndex, middleXOffset, yOffset, isJuries);
      const rightStartIndex = left + middle;
      const rightSeats = generateSectionSeats('right', rowIndex, sectionName, right, price, availability, pending, rightStartIndex, rightXOffset, yOffset, isJuries);

      return (
        <g key={`${sectionName}-row${rowIndex}`}>
          {leftSeats}
          {middleSeats}
          {rightSeats}
        </g>
      );
    }
  };

  const blueDotY = 1271.35;
  const juriesBaseY = blueDotY;

  return (
    <svg width="1064" height="1274" viewBox="0 0 1064 1274" xmlns="http://www.w3.org/2000/svg">
      <rect y="0" width="1064" height="1274" fill="#F9FAFB" />
      <image
        href={images.Ellipse}
        x={528.62 - 532 / 2}
        y={1274 - 112.65}
        width="532"
        height="152.65"
      />
      <circle cx="528.62" cy="1274" r="5" fill="red" visibility="hidden" />
      <circle cx="528.62" cy="1071.35" r="5" fill="blue" visibility="hidden" />
      <g id="balcony" transform="translate(532, 565.39)">
        <text className="label-2" x="-00" y="100">BALCONY</text>
        {balconyData.map((row, index) => generateRow('Balcony', index, row, index * 30))}
      </g>
      <g id="juries" transform={`translate(532, ${juriesBaseY})`}>
        <text className="label-2" x="0" y="-20"></text>
        {juriesData.map((row, index) => generateRow('Juries', index, row, index * (50.00 * scalingFactor), true))}
      </g>
      <text className="label" x="530" y="1250">STAGE</text>
    </svg>
  );
};

export default SeatMap;