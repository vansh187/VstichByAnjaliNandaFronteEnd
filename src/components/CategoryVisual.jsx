import { useState } from "react";
import Swatch from "./Swatch";
import { getCategoryTone } from "../utils/categoryTheme";

// Real category artwork when the backend has it, falling back to the
// branded gradient swatch when image_url is null (category created before
// its banner was uploaded) or the image fails to load.
export default function CategoryVisual({ category, className = "" }) {
  const [imgError, setImgError] = useState(false);

  if (category.image_url && !imgError) {
    return (
      <img
        src={category.image_url}
        alt={category.category_name}
        loading="lazy"
        onError={() => setImgError(true)}
        className={`object-cover object-top ${className}`}
      />
    );
  }

  return (
    <Swatch
      tone={getCategoryTone(category.vstitch_category_id)}
      monogram={category.category_name.slice(0, 2).toUpperCase()}
      className={className}
    />
  );
}
