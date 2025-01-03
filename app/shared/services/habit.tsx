function getDayLabel(dayIndex: number) {
  switch (dayIndex) {
    case 0:
      return "M";
    case 1:
      return "Tu";
    case 2:
      return "W";
    case 3:
      return "Th";
    case 4:
      return "Fr";
    case 5:
      return "Sa";
    case 6:
      return "Su";
    default:
      throw new Error("Invalid day index: " + dayIndex);
  }
}

const IconUnaccomplished = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
  </svg>
);
const IconAccomplished = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
  </svg>
);

function DayContainer(props: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      // inline styles here so that they can be included in statically rendered server response
      // which what trmnl uses to generate image
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "22px",
        color: "#757575",
        padding: "12px",
        border: "1px solid #000",
        ...props.style,
      }}
      className={props.className}
    >
      {props.children}
    </div>
  );
}

export function getDayMarkup(
  dayIndex: number,
  todayIndex: number,
  isAccomplished: boolean
) {
  // if day is today, this means we'll only show either the day label or the checkmark -- no way to mark
  // today as failed manually/prematurely, you just have to let the day pass
  //
  // i think this is fine: leaves hope until the last minute that you accomplish the thing! (also too lazy to refactor atm)
  if (dayIndex >= todayIndex && !isAccomplished)
    return (
      <DayContainer
        style={{
          ...(dayIndex === todayIndex ? { fontWeight: "bold" } : {}),
        }}
      >
        {getDayLabel(dayIndex)}
      </DayContainer>
    );

  return (
    <DayContainer className={isAccomplished ? "bg-gray-4" : "bg-gray-6"}>
      {isAccomplished ? IconAccomplished : IconUnaccomplished}
    </DayContainer>
  );
}
