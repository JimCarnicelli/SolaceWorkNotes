'use client'; 
import { ReactMarkdown, ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

export const markdownCommonSettings: ReactMarkdownOptions = {
    //TODO: Constrain what Markdown elements are allowed
    allowedElements: undefined,  // [];
    components: {
        h1: 'h3',
        h2: 'h4',
        h3: 'h5',
        h4: 'h6',
    },
    children: 'x',
}

type Props = {
    value?: string,
}

export function MarkdownViewer(props: Props) {
    return (
        <ReactMarkdown className='MarkdownViewer' {...markdownCommonSettings}>
            {props.value ?? ''}
        </ReactMarkdown>
    );
}
