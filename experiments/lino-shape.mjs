// Experiment: which LiNo record shape parses into a clean tree.
import { Parser } from 'links-notation';
const show = (s) =>
  console.log(
    JSON.stringify(new Parser().parse(s), (k, v) =>
      k === '_isFromPathCombination' ? undefined : v
    )
  );
show(`(button: component-entry (aria-pattern button) (apg 'https://x/y/') (material3 'common buttons'))
(color.primary: token-entry (layer system))`);
show(`(button: component-entry
  (aria-pattern button)
  (owner F26))`);
