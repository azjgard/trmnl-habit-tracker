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
      }}
      className="gray-4"
    >
      {isAccomplished ? "✅" : "X"}
    </div>
  );
}
