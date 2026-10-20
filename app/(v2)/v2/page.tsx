import { UiVariantLink } from '~/components/ui-variant-link';

/**
 * Placeholder for the v2 UI variant (#3). The variant's design (audience, the one
 * upload → translate → compare flow, visual direction, empty hero) is still open, so
 * this page only marks the route as work in progress.
 */
export default function V2HomePage() {
  return (
    <main className="v2-main" data-testid="v2-wip">
      <p className="v2-eyebrow">Work in progress</p>
      <h1>A new UI is being designed</h1>
      <p>
        This is where the next version of the interface will live, under a new name. Nothing
        here is final yet: the design brief comes first. Until then, the current UI stays the
        default.
      </p>
      <p>
        <UiVariantLink to="legacy" className="v2-button">
          Back to the current UI
        </UiVariantLink>
      </p>
    </main>
  );
}
