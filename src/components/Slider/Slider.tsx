import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../utils/cn";
import { formatFullTimestamp } from "../../utils/date";
import { Tooltip } from "../ui/Tooltip";
import "./Slider.css";

interface ISliderProps {
  value: number;
  onChange: (value: number) => void;
  data: {
    gaps: { start: number; end: number }[];
    dataByGapsPositions: { start: number; end: number }[];
    valueToPosition: (value: number) => number;
    positionToValue: (position: number) => number;
  };
  disabled?: boolean;
}

interface Gap {
  start: number;
  end: number;
}

export const Slider = ({
  value,
  onChange,
  data: sliderData,
  disabled = false,
}: ISliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const sliderPosition = useMemo(
    () => sliderData.valueToPosition(value),
    [sliderData, value]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();

      setIsDragging(true);

      const updatePosition = (clientX: number) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        const clampedPosition = Math.max(0, Math.min(100, position));
        const newValue = sliderData.positionToValue(clampedPosition);
        onChange(newValue);
      };

      if ("touches" in e) {
        updatePosition(e.touches[0].clientX);
      } else {
        updatePosition(e.clientX);
      }
    },
    [disabled, onChange, sliderData]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const rect = sliderRef.current.getBoundingClientRect();
      const position = ((clientX - rect.left) / rect.width) * 100;
      const clampedPosition = Math.max(0, Math.min(100, position));
      const newValue = sliderData.positionToValue(clampedPosition);
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, onChange, sliderData]);

  return (
    <Tooltip
      delayDuration={0}
      content={
        <div>
          {value && !isNaN(value)
            ? formatFullTimestamp(value)
            : "No value selected"}
        </div>
      }
      className="ml-[20px] rounded-md bg-[#3399FF] px-2 py-1.5 text-center text-xs text-white"
      align="start"
      sideOffset={12}
      disabled={!showTooltip}
    >
      <div
        ref={sliderRef}
        className={cn(
          "slider-container relative z-10 flex h-1.5 w-full cursor-pointer items-center",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="relative h-full w-full grow bg-[#3399FF] bg-opacity-30">
          <div
            className="absolute h-full bg-[#3399FF]"
            style={{ width: `${sliderPosition}%` }}
          />
        </div>

        {sliderData.gaps.map((gap: Gap) => (
          <span
            className={cn(
              "slider-break",
              sliderPosition >= gap.end && "slider-break--active"
            )}
            style={{ left: `${gap.end}%` }}
            key={`${gap.start}-${gap.end}`}
          />
        ))}

        <div
          ref={thumbRef}
          className={cn(
            "absolute h-5 w-5 -translate-x-1/2 rounded-full bg-[#3399FF] transition-shadow",
            "hover:shadow-[0_0_0_6px_rgba(102,178,255,0.3)]",
            "active:shadow-[0_0_0_8px_rgba(51,153,255,0.5)]",
            isDragging && "shadow-[0_0_0_8px_rgba(51,153,255,0.5)]"
          )}
          style={{ left: `${sliderPosition}%` }}
        />
      </div>
    </Tooltip>
  );
};
