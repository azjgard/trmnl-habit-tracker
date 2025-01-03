function getDayLabel(index: number) {
  switch (index) {
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
      throw new Error("Invalid day index: " + index);
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

export function getDayMarkup(
  index: number,
  isAccomplished: boolean,
  isPassed: boolean
) {
  if (!isPassed) {
    return getDayLabel(index);
  }

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
        fontWeight: "bold",
        fontSize: "22px",
        color: "#757575",
        border: "2px solid #555",
      }}
      className="bg-gray-6"
    >
      {isAccomplished ? IconAccomplished : IconUnaccomplished}
    </div>
  );
}
