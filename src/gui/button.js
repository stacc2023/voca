import styles from './button.module.scss';

export default function ButtonFrame({children, className}) {
    return (
        <div className={`${styles.frame} ${className.split(' ').map(name => styles[name]).join(' ')}`}>{children}</div>
    )
}