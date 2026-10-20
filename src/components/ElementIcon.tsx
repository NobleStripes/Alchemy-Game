import type { ElementDefinition } from '../game/domain/types'

export function ElementIcon({ element }: { element: ElementDefinition }) {
  const image = element.image
  if (!image) return <>{element.icon || element.sigil}</>
  return (
    <img
      className="element-photo-icon"
      src={`${import.meta.env.BASE_URL}${image.thumbnailSrc ?? image.src}`}
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
      decoding="async"
      title={`${image.description} ${image.credit}. ${image.license}. Credits and licenses are available in Settings.`}
    />
  )
}

export function ElementImageFigure({ element }: { element: ElementDefinition }) {
  const image = element.image
  if (!image) return null
  return (
    <figure className="element-image" aria-label={`${element.name} image and credit`}>
      <img
        src={`${import.meta.env.BASE_URL}${image.src}`}
        alt={image.description}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <p>{image.description}</p>
        <p>
          {image.credit}. <a href={image.sourceUrl}>Image source</a>
          {' · '}<a href={image.licenseUrl}>{image.license}</a>
          {image.licensePath && <>{' · '}<a href={`${import.meta.env.BASE_URL}${image.licensePath}`}>Full license text</a></>}
        </p>
        <p>{image.changes}</p>
      </figcaption>
    </figure>
  )
}
