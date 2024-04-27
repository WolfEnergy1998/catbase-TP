import psycopg2
from datetime import datetime
import threading
from enum import Enum

class Logger:
    class LogType(Enum):
        STARTED = 1
        STOPPED = 2
        DOWNLOADED = 3
        ERROR = 4

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
        return cls._instance

    # generate logs in format: event/cron_name/timestamp/?notes?
    def generate_log(self, log_type, cron, notes=''):
        current_datetime = datetime.now()
        formatted_datetime = current_datetime.strftime("%d/%m/%Y:%H/%M/%S")

        if log_type == self.LogType.STARTED:
            return "STARTED:" + str(cron) + ":" + formatted_datetime + ":" + notes

        if log_type == self.LogType.STOPPED:
            return "STOPPED:" + str(cron) + ":" + formatted_datetime + ":" + notes

        if log_type == self.LogType.DOWNLOADED:
            return "DOWNLOADED:" + str(cron) + ":" + formatted_datetime + ":" + notes

        if log_type == self.LogType.ERROR:
            return "ERROR:" + str(cron) + ":" + formatted_datetime + ":" + notes

    def insert_to_db(self, event, log_value, cron):
        try:
            print("Connecting to database...")
            connection = psycopg2.connect   (
                                                user="postgres",
                                                password="418492222",
                                                host="localhost",
                                                port="5432",
                                                database="catbase"
                                            )

            cursor = connection.cursor()
            querry = "INSERT INTO logs(event, value, cron) VALUES (%s, %s, %s)"

            event_name = ""
            if event == self.LogType.STARTED:
                event_name = "STARTED"
            if event == self.LogType.STOPPED:
                event_name = "STOPPED"
            if event == self.LogType.DOWNLOADED:
                event_name = "DOWNLOADED"
            if event == self.LogType.ERROR:
                event_name = "ERROR"

            data = (str(event_name), str(log_value), str(cron))

            cursor.execute(querry, data)
            connection.commit()

            if(cursor.rowcount > 0):
                print("Log inserted successfully...")
            else:
                print("Logging failed...")

            cursor.close()
            connection.close()
        except(Exception, psycopg2.Error) as Error:
            print("An error occured: ", Error)

    
    def saveLog(self, log):
        with open('logs.txt', 'a') as File:
            File.write(log+'\n')


    def logDB(self, event, log_value, cron):
        log = self.generate_log(event, log_value, cron)
        self.saveLog(log)
        self.insert_to_db(event, log_value, cron)


