// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { coreRuntimeCatalog } from '../game/content/runtimeCatalog'
import { elementImageSchema } from '../game/content/schema'
import { ElementIcon, ElementImageFigure } from './ElementIcon'

const elements = [{
  ...coreRuntimeCatalog.elementsById.get('ember')!,
  image: {
    src: 'images/test/photo.jpg', thumbnailSrc: 'images/test/icon.jpg',
    width: 640, height: 480, description: 'Test photograph', credit: 'Test creator',
    sourceUrl: 'https://example.com/photo', license: 'CC0', licenseUrl: 'https://example.com/license',
    licensePath: 'images/test/LICENSE.txt', changes: 'Resized.',
  },
}]

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('credited element photography', () => {
  it.each(elements)('renders $name with a decorative icon and an accessible, credited Atlas figure', (element) => {
    const image = element.image!
    const { container } = render(<><ElementIcon element={element} /><ElementImageFigure element={element} /></>)
    const icon = container.querySelector('.element-photo-icon')
    expect(icon).toHaveAttribute('src', `${import.meta.env.BASE_URL}${image.thumbnailSrc ?? image.src}`)
    expect(icon).toHaveAttribute('alt', '')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon?.getAttribute('title')).toContain(image.credit)
    const figure = within(screen.getByRole('figure', { name: `${element.name} image and credit` }))
    expect(figure.getByRole('img', { name: image.description })).toHaveAttribute('src', `${import.meta.env.BASE_URL}${image.src}`)
    expect(figure.getByText(image.description)).toBeVisible()
    expect(figure.getByRole('link', { name: 'Image source' })).toHaveAttribute('href', image.sourceUrl)
    expect(figure.getByRole('link', { name: image.license })).toHaveAttribute('href', image.licenseUrl)
    if (image.licensePath) {
      expect(figure.getByRole('link', { name: 'Full license text' })).toHaveAttribute('href', `${import.meta.env.BASE_URL}${image.licensePath}`)
    }
  })

  it('retains unchanged emoji and text fallbacks for core elements without photography', () => {
    const element = coreRuntimeCatalog.elementsById.get('ember')!
    const view = render(<><ElementIcon element={element} /><ElementImageFigure element={element} /></>)
    expect(view.container).toHaveTextContent(element.icon!)
    expect(view.container.querySelector('img')).toBeNull()
    expect(screen.queryByRole('figure')).not.toBeInTheDocument()
    view.rerender(<ElementIcon element={{ ...element, icon: undefined }} />)
    expect(view.container).toHaveTextContent(element.sigil)
  })

  it('respects a subpath deployment for thumbnails, full photos and bundled license links', () => {
    vi.stubEnv('BASE_URL', '/alchemy/')
    const element = elements[0]
    const { container } = render(<><ElementIcon element={element} /><ElementImageFigure element={element} /></>)
    expect(container.querySelector('.element-photo-icon')).toHaveAttribute('src', '/alchemy/images/test/icon.jpg')
    expect(screen.getByRole('img', { name: element.image!.description })).toHaveAttribute('src', '/alchemy/images/test/photo.jpg')
    expect(screen.getByRole('link', { name: 'Full license text' })).toHaveAttribute('href', '/alchemy/images/test/LICENSE.txt')
  })

  it('rejects remote assets, traversal and incomplete attribution metadata', () => {
    const image = elements[0].image!
    for (const src of ['https://example.com/photo.jpg', '../photo.jpg', 'images/../photo.jpg']) {
      expect(elementImageSchema.safeParse({ ...image, src }).success).toBe(false)
    }
    expect(elementImageSchema.safeParse({ ...image, credit: '' }).success).toBe(false)
    expect(elementImageSchema.safeParse({ ...image, licenseUrl: 'javascript:alert(1)' }).success).toBe(false)
  })
})
