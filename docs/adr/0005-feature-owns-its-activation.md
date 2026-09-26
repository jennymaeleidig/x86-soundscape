# A Feature owns its activation, its presentation and its Window

A Feature is a value: an id (`FeatureId`), a name, an appearance — icon and optional tooltip, as signals
— an optional Window description (shape, height, content component) and an `activate()`. Because those
closures need services, the rows are built by a root-provided `FeatureRegistry` that injects
`WindowService`, `WinampService` and `AmbienceService` once, so the definitions file stops being static
data and becomes an injectable — the surprise this record exists to explain. The glossary's own sentence
already described the shape, "a Feature may have a desktop Applet, open a Window, and/or trigger an
Action", and it maps member for member, so an Action is a row with no `window` rather than a second kind
of thing; the Applet keeps one `<button>` and one guarded `activate()`, losing its five-arm template and
its four `Feature.Ambience` checks, and the Pop-up keeps its own switch because a Pop-up is not one of
the three things a Feature may have. The identity enum stays deliberately *apart* from the value, because
`WindowService` keys the at-most-one-Window rule on a primitive that survives the copies the Desktop makes
of every row. Rejected: a declarative row plus a dispatcher — the same switch, moved out of the template
and into the module, leaving the row unable to say what happens; one class per Feature — seven classes for
seven static rows and a DI lifecycle nothing needs; and leaving the branches where they are, which the
deletion test refutes by re-deriving them across the Applet, the Menu and every Window content consumer.
