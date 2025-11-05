import { DataSource } from 'typeorm';
import DataSourceOptions from './DataSourceOptions';

const datasource = new DataSource(DataSourceOptions);
export default datasource;