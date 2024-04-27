from logger import Logger
import random 

#CREATE singleton instance
logger = Logger()

events = [Logger.LogType.STARTED, Logger.LogType.STOPPED, Logger.LogType.ERROR, Logger.LogType.DOWNLOADED]
crons = ['FDKAT', 'FELISPOLONIA', 'CATPEDIGREES', 'SIAMESSEE']


for iteration in range(10):
    event = events[random.randrange(len(events))]
    cron = crons[random.randrange(len(crons))]
    
    print(str(iteration), "-LOGGING: ", str(event), "/", str(iteration) + str("th event value"), "/", cron)
    logger.logDB(event, str(iteration) + str("th event value"), cron)

