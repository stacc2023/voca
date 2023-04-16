import katex from "katex";

export default function Latex(props) {

    let text = '<p>' + props.tex.split('\\\\').map(row => katex.renderToString(row, { output: 'mathml', throwOnError: false })).join('</p><p>') + '</p>';
    // let text = katex.renderToString(props.tex, { 
    //     output: 'mathml', 
    //     throwOnError: false, 
    //     strict: false,
    //     displayMode: true,
    // });

    return <div dangerouslySetInnerHTML={{__html:text}}>
    </div>
}