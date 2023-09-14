import './InputHarness.scss';
import { ReactNode } from 'react';
import { FieldState } from '@/lib/hooks/useForm';
import { icons } from '@/lib/components/graphics/Icon';
import { cn } from '@/lib/utilities/stringHelpers';
import { TooltipMessage, useTooltip } from '@/lib/hooks/useTooltip';

export type InputHarnessProps<T> = {
    field?: FieldState<T>,
    title?: ReactNode,
    tooltip?: TooltipMessage,
    prefix?: ReactNode,
    suffix?: ReactNode,
    beforeInput?: ReactNode,
    afterInput?: ReactNode,
    required?: boolean,
    width?: string | number,
    forceWidth?: boolean,
    bordered?: boolean,
    padded?: boolean,
    simTextBox?: boolean,
    marginLeft?: boolean,
    marginRight?: boolean,
    marginBottom?: boolean,
    errorMessage?: ReactNode,
    className?: string,
    children?: ReactNode,
    onClear?: () => void,
}

export function InputHarness<T>(props: InputHarnessProps<T>) {

    const field = props.field;
    const title = props.title ?? field?.title;
    const required = props.required ?? field?.required ?? false;
    const errorMessage = props.errorMessage ?? ((field?.touched || field?.submitted) && field?.errorMessage);

    const tooltip = useTooltip();

    return (
        <table
            className={
                'InputHarness' +
                cn('WithTitle', title) +
                cn(props.className) +
                cn('MarginLeft', props.marginLeft) +
                cn('MarginRight', props.marginRight) +
                cn('MarginBottom', props.marginBottom)
            }
            style={{
                maxWidth: props.width,
                width: props.width
                    ? (props.forceWidth ? props.width : '100%')
                    : undefined,
            }}
            {...tooltip(props.tooltip)}
        ><tbody>
            {title && (
                <tr>
                    <td></td>
                    <td colSpan={props.suffix ? 2 : 1} className='Title'>
                        {required && (
                            <span className='Required' title='Required'><icons.FaAsterisk /></span>
                        )}
                        <span>{title}</span>
                    </td>
                </tr>
            )}
            <tr>
                <td className={
                    'Prefix' +
                    cn('Empty', !props.prefix)
                }>
                    {props.prefix ?? <>&nbsp;</>}
                </td>
                <td className={
                    'Input' +
                    cn('Bordered', props.bordered || props.simTextBox) +
                    cn('Padded', props.padded) +
                    cn('SimTextBox', props.simTextBox) +
                    cn('WithBefore', props.bordered && props.beforeInput) +
                    cn('WithAfter', props.bordered && props.afterInput)
                }>
                    {props.beforeInput && (
                        <div className='BeforeInput'>
                            {props.beforeInput}
                        </div>
                    )}
                    {props.children}
                    {(props.onClear || props.afterInput) && (
                        <div className='AfterInput'>
                            {props.onClear && (
                                <div
                                    className='ClearButton'
                                    {...tooltip('Clear')}
                                    onClick={props.onClear}
                                >
                                    <icons.FaTimes />
                                </div>
                            )}
                            {props.afterInput}
                        </div>
                    )}
                </td>
                {props.suffix && (
                    <td className='Suffix'>{props.suffix}</td>
                )}
            </tr>
            {errorMessage && (
                <tr>
                    <td></td>
                    <td colSpan={props.suffix ? 2 : 1} className='ErrorMessage'>
                        {errorMessage}
                    </td>
                </tr>
            )}
        </tbody></table>
    );
}
