import Image from "next/image";
import logo from "../../Logo/Glossy Blue E Arrow Logo.png";

/** Brand links supply the accessible EntryFlow name beside this decorative mark. */
export function BrandLogo() {
  return <span className="brand-mark brand-logo" aria-hidden="true"><Image src={logo} alt="" width={96} height={96} sizes="64px" priority /></span>;
}
