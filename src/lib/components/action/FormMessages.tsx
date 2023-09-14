import './FormMessages.scss';
import { FormHook } from '@/lib/hooks/useForm'
import { icons } from '@/lib/components/graphics/Icon'

type Props = {
    form: FormHook<any>,
}

export function FormMessages(props: Props) {

    if (!props.form.errorMessage) return <></>;

    return (
        <div className='FormMessages'><div>
            <icons.FaExclamationTriangle />
            {props.form.errorMessage}
        </div></div>
    )
}
