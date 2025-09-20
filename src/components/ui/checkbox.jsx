import * as React from "react" ;
import * as CheckboxPrimitive from "@radix-ui/react-checkbox" ;
import {
  Check
} from "lucide-react" ;
import {
  cn
} from "@/lib/utils" const Checkbox = React.forwardRef(({
  className,
  ...props
},
ref) => ( )) Checkbox.displayName = CheckboxPrimitive.Root.displayName export {
  Checkbox
};
