import {
	BlockProps,
	InspectorProps
} from '../../../helpers/blocks';
import { FormInputCommonProps } from '../common';

type Attributes = FormInputCommonProps & {
	type: string
	inputWidth: number
	options: string | Array<{content: string, isDefault: boolean}>
	multipleSelection: boolean
}

export type FormMultipleChoiceInputProps = BlockProps<Attributes>
export interface FormMultipleChoiceInputInspectorProps extends InspectorProps<Attributes> {}
