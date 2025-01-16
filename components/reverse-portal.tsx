// https://github.com/httptoolkit/react-reverse-portal

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import * as ReactDOM from "react-dom";
import { usePrevious } from "../common/lifecycle";

type Options = {
  attributes: { [key: string]: string };
};

type Component<P> = React.Component<P> | React.ComponentType<P>;

type ComponentProps<C extends Component<any>> = C extends Component<infer P>
  ? P
  : never;

interface PortalNodeBase<C extends Component<any>> {
  // Used by the out portal to send props back to the real element
  // Hooked by InPortal to become a state update (and thus rerender)
  setPortalProps(p: ComponentProps<C>): void;
  // Used to track props set before the InPortal hooks setPortalProps
  getInitialPortalProps(): ComponentProps<C>;
  // Move the node from wherever it is, to this parent, replacing the placeholder
  mount(newParent: Node, placeholder: Node): void;
  // If mounted, unmount the node and put the initial placeholder back
  // If an expected placeholder is provided, only unmount if that's still that was the
  // latest placeholder we replaced. This avoids some race conditions.
  unmount(expectedPlaceholder?: Node): void;
}
export interface HtmlPortalNode<C extends Component<any> = Component<any>>
  extends PortalNodeBase<C> {
  element: HTMLElement;
}

// This is the internal implementation: the public entry points set elementType to an appropriate value
export const createPortalNode = <C extends Component<any>>(
  options?: Options
): HtmlPortalNode<C> => {
  let initialProps = {} as ComponentProps<C>;

  let parent: Node | undefined;
  let lastPlaceholder: Node | undefined;

  const element = document.createElement("div");

  if (options && typeof options === "object") {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  const portalNode: HtmlPortalNode<C> = {
    element,
    setPortalProps: (props: ComponentProps<C>) => {
      initialProps = props;
    },
    getInitialPortalProps: () => {
      return initialProps;
    },
    mount: (newParent: HTMLElement, newPlaceholder: HTMLElement) => {
      if (newPlaceholder === lastPlaceholder) {
        // Already mounted - noop.
        return;
      }
      portalNode.unmount();

      // To support SVG and other non-html elements, the portalNode's elementType needs to match
      // the elementType it's being rendered into
      // if (newParent !== parent) {
      //     if (!validateElementType(newParent)) {
      //         throw new Error(`Invalid element type for portal: "${elementType}" portalNodes must be used with ${elementType} elements, but OutPortal is within <${newParent.tagName}>.`);
      //     }
      // }

      newParent.replaceChild(portalNode.element, newPlaceholder);

      parent = newParent;
      lastPlaceholder = newPlaceholder;
    },
    unmount: (expectedPlaceholder?: Node) => {
      if (expectedPlaceholder && expectedPlaceholder !== lastPlaceholder) {
        // Skip unmounts for placeholders that aren't currently mounted
        // They will have been automatically unmounted already by a subsequent mount()
        return;
      }

      if (parent && lastPlaceholder) {
        parent.replaceChild(lastPlaceholder, portalNode.element);

        parent = undefined;
        lastPlaceholder = undefined;
      }
    },
  } as HtmlPortalNode<C>;

  return portalNode;
};

interface InPortalProps {
  node: HtmlPortalNode;
  children: React.ReactNode;
}

export const InPortal = ({ node, children }: InPortalProps) => {
  const [nodeProps, setNodeProps] = useState(node.getInitialPortalProps());
  node.setPortalProps = setNodeProps;

  return ReactDOM.createPortal(
    Children.map(children, (child) => {
      if (!isValidElement(child)) return child;
      return cloneElement(child, nodeProps);
    }),
    node.element
  );
};

type OutPortalProps<C extends Component<any>> = {
  node: HtmlPortalNode<C>;
} & Partial<ComponentProps<C>>;

export const OutPortal = <C extends Component<any>>({
  node,
  ...props
}: OutPortalProps<C>) => {
  const placeholderNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const placeholder = placeholderNode.current!;
    const parent = placeholder.parentNode!;
    node.mount(parent, placeholder);
    node.setPortalProps(props as ComponentProps<C>);

    return () => {
      node.unmount(placeholder);
      node.setPortalProps({} as ComponentProps<C>);
    };
  }, [node]);

  return <div ref={placeholderNode} />;
};
