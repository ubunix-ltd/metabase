import type { HTMLAttributes, Ref } from "react";
import { forwardRef, useCallback, useMemo, useState } from "react";
import _ from "underscore";
import ColorPill from "metabase/core/components/ColorPill";
import ColorRangeToggle from "./ColorRangeToggle";
import {
  PopoverColorList,
  PopoverColorRangeList,
  PopoverDivider,
  PopoverRoot,
} from "./ColorRangePopover.styled";

export interface ColorRangeContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  initialValue: string[];
  colors: string[];
  colorRanges?: string[][];
  colorMapping?: Record<string, string[]>;
  isQuantile?: boolean;
  onChange?: (newValue: string[]) => void;
  onClose?: () => void;
}

const ColorSelectorContent = forwardRef(function ColorRangeSelector(
  {
    initialValue,
    colors,
    colorRanges = [],
    colorMapping: customColorMapping,
    isQuantile,
    onChange,
    onClose,
    ...props
  }: ColorRangeContentProps,
  ref: Ref<HTMLDivElement>,
) {
  const colorMapping = useMemo(() => {
    return customColorMapping ?? getDefaultColorMapping(colors);
  }, [colors, customColorMapping]);

  const [isInverted, setIsInverted] = useState(() =>
    getDefaultIsInverted(initialValue, colorMapping),
  );

  const [color, setColor] = useState(() =>
    getDefaultColor(initialValue, colors, colorMapping),
  );

  const [value, setValue] = useState(() =>
    getColorRange(color, colorMapping, isInverted),
  );

  const handleColorSelect = useCallback(
    (newColor: string) => {
      const newValue = getColorRange(newColor, colorMapping, isInverted);

      setColor(newColor);
      setValue(newValue);
      onChange?.(newValue);
    },
    [colorMapping, isInverted, onChange],
  );

  const handleToggleInvertedClick = useCallback(() => {
    const newValue = getColorRange(color, colorMapping, !isInverted);

    setIsInverted(!isInverted);
    setValue(newValue);
    onChange?.(newValue);
  }, [color, colorMapping, isInverted, onChange]);

  return (
    <PopoverRoot {...props} ref={ref}>
      <PopoverColorList>
        {colors.map((value, index) => (
          <ColorPill
            key={index}
            color={value}
            isSelected={value === color}
            onSelect={handleColorSelect}
          />
        ))}
      </PopoverColorList>
      <ColorRangeToggle
        value={value}
        isQuantile={isQuantile}
        onClick={handleToggleInvertedClick}
      />
      {colorRanges.length > 0 && <PopoverDivider />}
      <PopoverColorRangeList>
        {colorRanges?.map((range, index) => (
          <ColorRangeToggle
            key={index}
            value={range}
            isQuantile={isQuantile}
            onClick={handleToggleInvertedClick}
          />
        ))}
      </PopoverColorRangeList>
    </PopoverRoot>
  );
});

const getColorRange = (
  color: string,
  colorMapping: Record<string, string[]>,
  isInverted = false,
) => {
  if (isInverted) {
    return [...colorMapping[color]].reverse();
  } else {
    return colorMapping[color];
  }
};

const getDefaultColor = (
  value: string[],
  colors: string[],
  colorMapping: Record<string, string[]>,
) => {
  return Object.entries(colorMapping).reduce((selection, [color, range]) => {
    if (_.isEqual(value, range)) {
      return color;
    } else if (_.isEqual(value, [...range].reverse())) {
      return color;
    } else {
      return selection;
    }
  }, colors[0]);
};

const getDefaultColorMapping = (colors: string[]) => {
  return Object.fromEntries(colors.map(color => [color, ["white", color]]));
};

const getDefaultIsInverted = (
  value: string[],
  colorMapping: Record<string, string[]>,
) => {
  return Object.values(colorMapping).some(range => {
    return _.isEqual(value, [...range].reverse());
  });
};

// eslint-disable-next-line import/no-default-export -- deprecated usage
export default ColorSelectorContent;
