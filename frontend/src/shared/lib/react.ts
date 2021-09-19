import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Location } from "history";

// ref: https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RenderDynamicWithHooks = ({ children }: any) => children();

export const useLocationChanged = (
  onChanged: (location: Location<unknown>) => void
) => {
  const history = useHistory();
  useEffect(() => {
    onChanged(history.location);

    return history.listen((location) => {
      onChanged(location);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);
};
