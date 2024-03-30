import { NoSsr } from "@mui/material";

const Ua = () => {
  return (
    <div>
      <p>userAgent: {navigator.userAgent}</p>
      <p>
        ontouchend:
        {`${typeof document !== "undefined" && "ontouchend" in document}`}
      </p>
      <p>isIpad: {`${/iPad|macintosh/i.test(navigator.userAgent)}`}</p>
      <p>
        isMobile:
        {`${/iPhone|iPad|iPod|Android|macintosh/i.test(navigator.userAgent)}`}
      </p>
      <p>
        isSafari:
        {`${/^((?!chrome|android).)*safari/i.test(navigator.userAgent)}`}
      </p>
    </div>
  );
};

export default () => {
  return (
    <div>
      <p>ua</p>
      <NoSsr>
        <Ua />
      </NoSsr>
    </div>
  );
};
