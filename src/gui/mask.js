import styles from './mask.module.scss';

export default function Mask({ children }) {
    return (
        <div className={styles.mask}>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}