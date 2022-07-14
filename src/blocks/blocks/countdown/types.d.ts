import { BlockProps, BoxType, InspectorProps, PaddingType } from '../../helpers/blocks'

type Attributes = {
	id: string
	date: string
	exclude: string[]
	backgroundColor: string
	valueColor: string
	labelColor: string
	separatorColor: string
	labelDistance: number
	gap: number
	gapTablet: number
	gapMobile: number
	width: number
	widthTablet: number
	widthMobile: number
	containerWidth: number
	containerWidthTablet: number
	containerWidthMobile: number
	height: number
	heightTablet: number
	heightMobile: number
	borderRadius: number | BoxType
	borderRadiusBox: BoxType
	borderStyle: string
	borderWidth: number
	borderWidthTablet: number
	borderWidthMobile: number
	borderColor: string
	valueFontSize: number
	valueFontSizeTablet: number
	valueFontSizeMobile: number
	labelFontSize: number
	labelFontSizeTablet: number
	labelFontSizeMobile: number
	hasSeparators: boolean
	alignment: 'flex-start' | 'center' | 'flex-end'
	padding: PaddingType
	paddingMobile: PaddingType
	paddingTablet: PaddingType
	valueFontWeight: string
	labelFontWeight: string
}

export type CountdownProps = BlockProps<Attributes>
export interface CountdownInspectorProps extends InspectorProps<Attributes> {}
