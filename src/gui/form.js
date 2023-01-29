import styles from './form.module.scss';

export default function Form({ children }) {
    return (
        <table className={styles.form}>
            <tbody>
                {children.map(child => {
                    return (
                        <tr key={child.props.id}>
                            <td>
                                <label htmlFor={child.props.id}>{child.props.name || child.props.id}</label>
                            </td>
                            <td>
                                {child}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}