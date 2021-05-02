import { useEffect } from "react";
import { useHistory } from "react-router-dom";

// ref: https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RenderDynamicWithHooks = ({ children }: any) => children();

export const useLocationPathChanged = (
  onChanged: (newPath: string) => void
) => {
  const history = useHistory();
  useEffect(() => {
    onChanged(history.location.pathname);

    return history.listen((location) => {
      onChanged(location.pathname);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);
};
